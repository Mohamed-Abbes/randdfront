import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { Article } from '../../models/article';

@Component({
  selector: 'app-moderator',
  templateUrl: './moderator.component.html',
  styleUrls: ['./moderator.component.scss']
})
export class ModeratorComponent implements OnInit {
  apiUrl = 'http://localhost:8090/api/articles';
  pendingArticles: any[] = [];
  approvedArticles: any[] = [];
  rejectedArticles: any[] = [];
  articles: Article[] = [];
  currentFilter = 'pending';
  rejectionReason = '';
  currentUserId = '';
  selectedArticleId?: number;
  showRejectionModal = false;
  articleStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
  };

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getIdFromToken();
    this.loadAllArticles();
  }

  loadAllArticles(): void {
    this.loadPendingArticles();
    this.loadApprovedArticles();
    this.loadRejectedArticles();
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

  loadPendingArticles(): void {
    this.http.get<any>(`${this.apiUrl}/pending`).subscribe({
      next: (response) => {
        this.pendingArticles = response?.articles || [];
      },
      error: (error) => {
        console.error('Error fetching pending articles:', error);
        this.pendingArticles = [];
      }
    });
  }

  loadApprovedArticles(): void {
    this.http.get<any>(`${this.apiUrl}/approved`).subscribe({
      next: (response) => {
        this.approvedArticles = response?.articles || [];
      },
      error: (error) => {
        console.error('Error fetching approved articles:', error);
        this.approvedArticles = [];
      }
    });
  }

  loadRejectedArticles(): void {
    this.http.get<any>(`${this.apiUrl}/rejected`).subscribe({
      next: (response) => {
        this.rejectedArticles = response?.articles || [];
      },
      error: (error) => {
        console.error('Error fetching rejected articles:', error);
        this.rejectedArticles = [];
      }
    });
  }


  setFilter(filter: string): void {
    this.currentFilter = filter;
  }

  getCurrentArticles(): any[] {
    switch (this.currentFilter) {
      case 'approved': return this.approvedArticles;
      case 'rejected': return this.rejectedArticles;
      default: return this.pendingArticles;
    }
  }

  cancelRejection(): void {
    this.showRejectionModal = false;
    this.rejectionReason = '';
  }

  approveArticle(articleId: number): void {
    this.http.put<any>(`${this.apiUrl}/approve/${articleId}`, {}).subscribe({
      next: () => {
        this.showSuccessMessage('Article approved');
        this.loadAllArticles

      },
      error: (error) => {
        console.error('Error approving article:', error)
        this.showErrorMessage('Failed to reject article')}
    });
  }

  rejectArticle(articleId: number, reason: string): void {
    if (!reason) {
      alert('Please provide a rejection reason');
      return;
    }

    this.http.put<any>(`${this.apiUrl}/reject/${articleId}`, { reason }).subscribe({
      next: () => {
        this.showSuccessMessage('Article rejected');
        this.loadAllArticles
      },
      error: (error) => {
        console.error('Error rejecting article:', error);
        this.showErrorMessage('Failed to reject article');
      }
    });
  }


  private showSuccessMessage(message: string): void {
    alert('Success: ' + message); // Basic implementation
  }

  private showErrorMessage(message: string): void {
    alert('Error: ' + message); // Basic implementation
  }

  canModerate(article: any): boolean {
    return this.isModerator() && article.status === this.articleStatus.PENDING;
  }

  // User Role Checks
  isModerator(): boolean {
    return ['MODERATOR', 'ADMIN'].includes(this.authService.getRoleFromToken());
  }

  isAdmin(): boolean {
    return this.authService.getRoleFromToken() === 'ADMIN';
  }


  logout(): void {
    this.authService.signOut();
  }

  openRejectionModal(articleId: number): void {
    this.selectedArticleId = articleId;
    this.showRejectionModal = true;
    this.rejectionReason = ''; // Reset reason when opening
  }

  closeRejectionModal(): void {
    this.showRejectionModal = false;
  }

  submitRejection(): void {
    if (!this.selectedArticleId || !this.rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    this.rejectArticle(this.selectedArticleId, this.rejectionReason);
    this.closeRejectionModal();
  }
}