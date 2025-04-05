import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  articles: any[] = [];
  apiUrl = 'http://localhost:8090/api/articles';
  newArticle = { title: '', content: '', category: '', user: { id: '' } };
  searchInput = '';
  categories = ['AI', 'CYBERSEC', 'NLP'];
  fullName = '';
  currentUserId = '';
  currentUserEmail = '';
  isUpdating = false;
  updatingArticleId: number | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getIdFromToken();
    this.currentUserEmail = this.authService.getEmailFromToken();
    this.fullName = this.authService.getfullNameFromToken();
    this.newArticle.user.id = this.currentUserId;
    this.getAllArticles();
  }

  isArticleOwner(article: any): boolean {
    return article.user?.id === this.currentUserId;
  }
  
  //Show all articles
  getAllArticles(): void {
    this.http.get<any>(`${this.apiUrl}/all`).subscribe({
      next: (response) => {
        this.articles = response?.articles || [];
        // Ensure each article has a pdfUrl property
        this.articles = this.articles.map(article => ({
          ...article,
          pdfUrl: article.pdfUrl || null
        }));
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
        this.articles = [];
      }
    });
  }
  //Adding article
  addArticle(): void {
    if (!this.validateArticle()) return;
    const articleData = {
      title: this.newArticle.title,
      content: this.newArticle.content,
      category: this.newArticle.category,
      user: { id: this.currentUserId }
    };

    this.http.post<any>(this.apiUrl, articleData).subscribe({
      next: () => {
        this.getAllArticles();
        this.resetForm();
      },
      error: (error) => console.error('Error adding article:', error)
    });
  }

  //Updating Article
  prepareUpdate(article: any): void {
    this.isUpdating = true;
    this.updatingArticleId = article.id;
    this.newArticle = {
      title: article.title,
      content: article.content,
      category: article.category,
      user: { id: this.currentUserId }
    };
  }

  updateArticle(): void {
    if (!this.updatingArticleId || !this.validateArticle()) return;

    const articleData = {
      title: this.newArticle.title,
      content: this.newArticle.content,
      category: this.newArticle.category,
      user: { id: this.currentUserId }
    };

    this.http.put<any>(`${this.apiUrl}/update/${this.updatingArticleId}`, articleData).subscribe({
      next: () => {
        this.getAllArticles();
        this.resetForm();
        this.cancelUpdate();
      },
      error: (error) => console.error('Error updating article:', error)
    });
  }

  cancelUpdate(): void {
    this.isUpdating = false;
    this.updatingArticleId = null;
    this.resetForm();
  }

  //Deleting the article
  deleteArticle(id: number): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.http.delete<any>(`${this.apiUrl}/delete/${id}`).subscribe({
        next: () => this.getAllArticles(),
        error: (error) => console.error('Error deleting article:', error)
      });
    }
  }


  //Searching an article
  searchArticle(): void {
    if (!this.searchInput.trim()) {
      this.getAllArticles();
      return;
    }

    this.http.get<any>(`${this.apiUrl}/search?input=${this.searchInput}`).subscribe({
      next: (response) => {
        this.articles = response?.data || response?.articles || [];
      },
      error: (error) => {
        console.error('Error searching articles:', error);
        this.articles = [];
      }
    });
  }

  clearSearch(): void {
    this.searchInput = '';
    this.getAllArticles();
  }


  //Attaching PDF to the article
  uploadPdf(articleId: number, event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    this.http.post<any>(`${this.apiUrl}/upload-pdf/${articleId}`, formData).subscribe({
      next: () => {
        this.getAllArticles();
        event.target.value = '';
      },
      error: (error) => console.error('Error uploading PDF:', error)
    });
  }



  downloadPdf(pdfUrl: string): void {
    if (!pdfUrl) return;
    
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = `article_${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  validateArticle(): boolean {
    if (!this.newArticle.title || !this.newArticle.content || !this.newArticle.category) {
      alert('Please fill all fields');
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.newArticle = { 
      title: '', 
      content: '', 
      category: '', 
      user: { id: this.currentUserId } 
    };
  }

  logout(): void {
    this.authService.signOut();
  }
}