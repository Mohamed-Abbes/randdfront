export interface Article {
    id: number;
    title: string;
    content: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    category: string;
    user: {
      id: string;
      name?: string;
    };
    createdAt?: Date | string; // Can handle both Date objects and ISO strings
    pdfUrl?: string;
    doi?: string;
  }