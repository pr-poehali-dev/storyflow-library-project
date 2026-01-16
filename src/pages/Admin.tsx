import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: number;
  type: string;
  author_name: string;
  rating: number;
  content: string;
  status: string;
  book_title?: string;
  created_at: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  created_at: string;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.includes('/admin')) {
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/e193c4a8-fdcf-44c4-82e1-d838e9db80fc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        toast({
          title: 'Успешный вход',
          description: 'Добро пожаловать в админ-панель',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при входе',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, booksRes] = await Promise.all([
        fetch('https://functions.poehali.dev/e193c4a8-fdcf-44c4-82e1-d838e9db80fc?action=reviews', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('https://functions.poehali.dev/e193c4a8-fdcf-44c4-82e1-d838e9db80fc?action=books', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      if (reviewsRes.ok && booksRes.ok) {
        const reviewsData = await reviewsRes.json();
        const booksData = await booksRes.json();
        setReviews(reviewsData);
        setBooks(booksData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/e193c4a8-fdcf-44c4-82e1-d838e9db80fc', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'review',
          id,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Отзыв удалён',
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить отзыв',
        variant: 'destructive',
      });
    }
  };

  const handleApproveReview = async (id: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/8efe5b27-e629-4985-84eb-cccf3a97fc23', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: 'approved',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Отзыв одобрен',
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось одобрить отзыв',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/e193c4a8-fdcf-44c4-82e1-d838e9db80fc', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'book',
          id,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Книга удалена',
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить книгу',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    navigate('/');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Icon name="Shield" size={48} className="mx-auto mb-3 text-primary" />
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Админ-панель
            </h1>
            <p className="text-muted-foreground">
              Введите пароль для доступа
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Shield" size={32} className="text-primary" />
            <h1 className="font-serif text-2xl font-bold">Админ-панель</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="reviews">
              Отзывы ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="books">
              Книги ({books.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="MessageSquare" size={48} className="mx-auto mb-3 opacity-50" />
                <p>Нет отзывов</p>
              </div>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{review.author_name}</h3>
                        <Badge variant={
                          review.status === 'approved' ? 'default' :
                          review.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {review.status === 'approved' ? 'Одобрен' :
                           review.status === 'pending' ? 'На модерации' : 'Отклонён'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.type === 'book' ? `Книга: ${review.book_title}` : 'Отзыв о приложении'}
                      </p>
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

                  <p className="text-sm mb-4">{review.content}</p>

                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveReview(review.id)}
                        className="gap-2"
                      >
                        <Icon name="Check" size={16} />
                        Одобрить
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteReview(review.id)}
                      className="gap-2"
                    >
                      <Icon name="Trash2" size={16} />
                      Удалить
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Book" size={48} className="mx-auto mb-3 opacity-50" />
                <p>Нет книг</p>
              </div>
            ) : (
              books.map((book) => (
                <Card key={book.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-bold mb-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {book.author} • {book.year} • {book.genre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Добавлена: {new Date(book.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteBook(book.id)}
                      className="gap-2"
                    >
                      <Icon name="Trash2" size={16} />
                      Удалить
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
