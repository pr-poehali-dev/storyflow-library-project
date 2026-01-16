import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Review {
  id: number;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
}

interface ReviewsListProps {
  type: 'book' | 'app';
  bookId?: number;
}

export default function ReviewsList({ type, bookId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [type, bookId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      let url = `https://functions.poehali.dev/8efe5b27-e629-4985-84eb-cccf3a97fc23?type=${type}&status=approved`;
      if (bookId) {
        url += `&book_id=${bookId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon name="MessageSquare" size={48} className="mx-auto mb-3 opacity-50" />
        <p>Пока нет отзывов. Будьте первым!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4 animate-fade-in">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-foreground">{review.author_name}</h4>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-sm">
                    {i < review.rating ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {review.content}
          </p>
        </Card>
      ))}
    </div>
  );
}
