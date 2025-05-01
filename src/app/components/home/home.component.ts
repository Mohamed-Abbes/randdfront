import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
interface PredictionResponse {
  category?: string;
  confidence?: number;
  error?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:8090/api/articles';

  articles: any[] = [];
  categories = ['AI', 'CYBERSEC', 'NLP'];

  readonly articleStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
  };

  newArticle = {
    title: '',
    content: '',
    doi: '',
    category: '',
    user: { id: '' }
  };

  currentUserId = '';
  currentUserEmail = '';
  fullName = '';
  userRole = '';

  searchInput = '';
  isUpdating = false;
  updatingArticleId: number | null = null;
  currentFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';


  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeUserData();
    this.getAllArticles();
  }

  private initializeUserData(): void {
    this.currentUserId = this.authService.getIdFromToken();
    this.currentUserEmail = this.authService.getEmailFromToken();
    this.fullName = this.authService.getfullNameFromToken();
    this.userRole = this.authService.getRoleFromToken();
    this.newArticle.user.id = this.currentUserId;
  }

  getAllArticles(filter: 'all' | 'pending' | 'approved' | 'rejected' = 'all'): void {
    let endpoint = `${this.apiUrl}/all`;
    if (filter !== 'all') endpoint = `${this.apiUrl}/${filter}`;

    this.http.get<any>(endpoint).subscribe({
      next: (response) => {
        this.articles = response?.articles || response || [];
        this.articles = this.articles.map(article => ({
          ...article,
          pdfUrl: article.pdfUrl || null
        }));
        this.currentFilter = filter;
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
        this.articles = [];
      }
    });
  }

  addArticle(): void {
    if (!this.validateArticle()) return;
    const articleData = {
      ...this.newArticle,
      status: this.articleStatus.PENDING
    };

    this.http.post<any>(this.apiUrl, articleData).subscribe({
      next: () => {
        alert('Article submitted for moderation');
        this.getAllArticles(this.currentFilter);
        this.resetForm();
      },
      error: (error) => {
        console.error('Error adding article:', error);
        alert('Error: ' + error);
      }
    });
  }

  updateArticle(): void {
    if (!this.updatingArticleId || !this.validateArticle()) return;

    const articleData = {
      title: this.newArticle.title,
      content: this.newArticle.content,
      //category: this.newArticle.category,
      user: { id: this.currentUserId }
    };

    this.http.put<any>(`${this.apiUrl}/update/${this.updatingArticleId}`, articleData).subscribe({
      next: () => {
        this.getAllArticles(this.currentFilter);
        this.resetForm();
        this.cancelUpdate();
      },
      error: (error) => console.error('Error updating article:', error)
    });
  }

  deleteArticle(id: number): void {
    if (!confirm('Are you sure you want to delete this article?')) return;

    this.http.delete<any>(`${this.apiUrl}/delete/${id}`).subscribe({
      next: () => this.getAllArticles(this.currentFilter),
      error: (error) => console.error('Error deleting article:', error)
    });
  }

  downloadPdf(articleId: number): void {
    const link = document.createElement('a');
    link.href = `${this.apiUrl}/download-pdf/${articleId}`;
    link.target = '_blank';
    link.download = `article_${articleId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async uploadPdf(articleId: number, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
  
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      // First upload the PDF
      this.http.post<any>(`${this.apiUrl}/upload-pdf/${articleId}`, formData).subscribe({
        next: async () => {
          // After successful upload, get prediction for tags
          try {
            const predictionResponse = await this.http.post<{category: string, confidence: number}>(
              'http://localhost:5000/predict', 
              formData
            ).toPromise();
            
            if (predictionResponse) {
              // Update the article with the predicted category as a tag
              const tag = predictionResponse.category;
              const updateData = { tag: tag };
              console.log("Prediction response: ", updateData)

              await this.http.put(`${this.apiUrl}/update/${articleId}`, updateData).toPromise();
            }
          } catch (predictionError) {
            console.error('Error getting prediction:', predictionError);
          }
          
          // Refresh the articles list
          this.getAllArticles(this.currentFilter);
          input.value = '';
        },
        error: (error) => console.error('Error uploading PDF:', error)
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
    }
  }

updateArticleCategory(articleId: number, category: string): void {
  const articleData = {
    category: category
  };

  this.http.patch<any>(`${this.apiUrl}/update/${articleId}`, articleData).subscribe({
    next: () => {
      this.getAllArticles(this.currentFilter);
    },
    error: (error) => console.error('Error updating article category:', error)
  });
}

  searchArticle(): void {
    const trimmed = this.searchInput.trim();
    if (!trimmed) {
      this.getAllArticles(this.currentFilter);
      return;
    }

    this.http.get<any>(`${this.apiUrl}/search?input=${trimmed}`).subscribe({
      next: (response) => {
        this.articles = response?.articles || response?.data || [];
      },
      error: (error) => {
        console.error('Error searching articles:', error);
        this.articles = [];
      }
    });
  }

  clearSearch(): void {
    this.searchInput = '';
    this.getAllArticles(this.currentFilter);
  }

  validateArticle(): boolean {
    if (!this.newArticle.title || !this.newArticle.content || !this.newArticle.category) {
      alert('Please fill all required fields');
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.newArticle = {
      title: '',
      content: '',
      doi: '',
      category: '',
      user: { id: this.currentUserId }
    };
  }

  prepareUpdate(article: any): void {
    this.isUpdating = true;
    this.updatingArticleId = article.id;
    this.newArticle = {
      title: article.title,
      content: article.content,
      doi: article.doi,
      category: article.category,
      user: { id: this.currentUserId }
    };
  }

  cancelUpdate(): void {
    this.isUpdating = false;
    this.updatingArticleId = null;
    this.resetForm();
  }

  isArticleOwner(article: any): boolean {
    return article.user?.id === this.currentUserId;
  }

  logout(): void {
    this.authService.signOut();
  }

  isAdmin(): boolean {
    console.log(this.userRole)
    return this.userRole === 'ADMIN';
  }

  isModerator(): boolean {
    console.log(this.userRole)
    return this.userRole === 'MODERATOR';
  }


  predictPdfCategory(filex: File): Promise<string> {
    const file = new FormData();
    file.append('file', filex);
  
    return this.http.post<PredictionResponse>('http://localhost:5000/predict', file).toPromise()
      .then((response: PredictionResponse | undefined) => {
        if (!response) {
          console.error('Empty response from prediction API');
          return '';
        }
  
        if ('error' in response && response.error) {
          console.error('Prediction API error:', response.error);
          return '';
        }
  
        if ('category' in response && response.category) {
          console.log(`Predicted category returned: ${response.category}, Confidence: ${response.confidence}`);
          return response.category;
        }
  
        console.error('Unexpected response format:', response);
        return '';
      })
      .catch((error) => {
        console.error('Error predicting PDF category:', error);
        return '';
      });
  }

}