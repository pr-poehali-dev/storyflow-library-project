import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import SearchBar from '@/components/SearchBar';
import BookCard from '@/components/BookCard';
import GenreFilter from '@/components/GenreFilter';
import AddBookDialog from '@/components/AddBookDialog';
import BookReader from '@/components/BookReader';
import BookDetails from '@/components/BookDetails';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  description: string;
  cover_url?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [readerBookId, setReaderBookId] = useState<string | null>(null);
  const [detailsBookId, setDetailsBookId] = useState<string | null>(null);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bd6a2732-86ce-4673-a032-4d305f7946ef');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Ошибка загрузки книг:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const allGenres = Array.from(new Set(books.map(book => book.genre)));

  const handleToggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(id)) {
        newBookmarks.delete(id);
      } else {
        newBookmarks.add(id);
      }
      return newBookmarks;
    });
  };

  const handleReadBook = (id: string) => {
    setReaderBookId(id);
  };

  const handleShowDetails = (id: string) => {
    setDetailsBookId(id);
  };

  const filteredBooks = books.filter(book => {
    const bookId = String(book.id);
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === null || book.genre === selectedGenre;
    const matchesBookmark = activeTab !== 'bookmarks' || bookmarks.has(bookId);
    
    return matchesSearch && matchesGenre && matchesBookmark;
  });

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-br from-accent to-secondary rounded-2xl p-8 md:p-12 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          Добро пожаловать в StoryFlow
        </h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Уютная библиотека для любителей чтения. Находите книги по душе, сохраняйте закладки и наслаждайтесь литературой.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" className="gap-2" onClick={() => setActiveTab('catalog')}>
            <Icon name="Library" size={20} />
            Открыть каталог
          </Button>
          <Button size="lg" variant="outline" className="gap-2" onClick={() => setActiveTab('genres')}>
            <Icon name="Tags" size={20} />
            Обзор жанров
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
          Популярные книги
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {books.slice(0, 4).map(book => (
            <BookCard
              key={book.id}
              id={String(book.id)}
              title={book.title}
              author={book.author}
              genre={book.genre}
              year={book.year}
              description={book.description || ''}
              coverUrl={book.cover_url}
              isBookmarked={bookmarks.has(String(book.id))}
              onToggleBookmark={handleToggleBookmark}
              onRead={handleReadBook}
              onDetails={handleShowDetails}
            />
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-2xl font-bold text-foreground">
            Отзывы о StoryFlow
          </h3>
          <ReviewForm type="app" />
        </div>
        <ReviewsList type="app" />
      </div>
    </div>
  );

  const renderCatalog = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          Каталог книг
        </h2>
        <p className="text-muted-foreground">
          Найдено книг: {filteredBooks.length}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full">
          <SearchBar onSearch={setSearchQuery} />
        </div>
        <AddBookDialog onBookAdded={loadBooks} />
      </div>
      
      <GenreFilter
        genres={allGenres}
        selectedGenre={selectedGenre}
        onGenreSelect={setSelectedGenre}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <BookCard
              key={book.id}
              id={String(book.id)}
              title={book.title}
              author={book.author}
              genre={book.genre}
              year={book.year}
              description={book.description || ''}
              coverUrl={book.cover_url}
              isBookmarked={bookmarks.has(String(book.id))}
              onToggleBookmark={handleToggleBookmark}
              onRead={handleReadBook}
              onDetails={handleShowDetails}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <Icon name="SearchX" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Книги не найдены. Попробуйте изменить параметры поиска.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGenres = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          Жанры
        </h2>
        <p className="text-muted-foreground">
          Выберите жанр для просмотра книг
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allGenres.map(genre => {
          const genreBooks = books.filter(b => b.genre === genre);
          return (
            <div
              key={genre}
              onClick={() => {
                setSelectedGenre(genre);
                setActiveTab('catalog');
              }}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:border-primary transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {genre}
                </h3>
                <Icon name="ChevronRight" size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-muted-foreground">
                {genreBooks.length} {genreBooks.length === 1 ? 'книга' : 'книг'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderBookmarks = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          Закладки
        </h2>
        <p className="text-muted-foreground">
          Сохранённые книги: {bookmarks.size}
        </p>
      </div>

      {bookmarks.size > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {books.filter(book => bookmarks.has(String(book.id))).map(book => (
            <BookCard
              key={book.id}
              id={String(book.id)}
              title={book.title}
              author={book.author}
              genre={book.genre}
              year={book.year}
              description={book.description || ''}
              coverUrl={book.cover_url}
              isBookmarked={true}
              onToggleBookmark={handleToggleBookmark}
              onRead={handleReadBook}
              onDetails={handleShowDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Icon name="BookmarkX" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-serif text-xl font-bold text-foreground mb-2">
            Закладок пока нет
          </h3>
          <p className="text-muted-foreground mb-6">
            Добавляйте книги в закладки, чтобы быстро находить их позже
          </p>
          <Button onClick={() => setActiveTab('catalog')} className="gap-2">
            <Icon name="Library" size={20} />
            Перейти в каталог
          </Button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'catalog':
        return renderCatalog();
      case 'genres':
        return renderGenres();
      case 'bookmarks':
        return renderBookmarks();
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          renderContent()
        )}
      </main>

      <BookReader
        bookId={readerBookId}
        open={readerBookId !== null}
        onClose={() => setReaderBookId(null)}
      />

      <BookDetails
        bookId={detailsBookId}
        open={detailsBookId !== null}
        onClose={() => setDetailsBookId(null)}
        onRead={() => {
          setReaderBookId(detailsBookId);
          setDetailsBookId(null);
        }}
      />

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Icon name="BookHeart" size={20} />
            StoryFlow — уютная библиотека для любителей чтения
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;