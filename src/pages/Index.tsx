import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SearchBar from '@/components/SearchBar';
import BookCard from '@/components/BookCard';
import GenreFilter from '@/components/GenreFilter';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  description: string;
  coverUrl?: string;
  isBookmarked?: boolean;
}

const SAMPLE_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    genre: 'Классика',
    year: 1967,
    description: 'Роман о дьяволе, который приезжает в Москву 1930-х годов вместе со свитой. Произведение переплетает две линии повествования: московскую современность и древний Ершалаим.',
  },
  {
    id: '2',
    title: 'Преступление и наказание',
    author: 'Фёдор Достоевский',
    genre: 'Классика',
    year: 1866,
    description: 'Психологический роман о студенте Родионе Раскольникове, который решается на убийство старухи-процентщицы. История о муках совести и искуплении.',
  },
  {
    id: '3',
    title: 'Война и мир',
    author: 'Лев Толстой',
    genre: 'Классика',
    year: 1869,
    description: 'Эпопея о русском обществе в эпоху войн против Наполеона. Переплетение судеб аристократических семей на фоне исторических событий.',
  },
  {
    id: '4',
    title: '1984',
    author: 'Джордж Оруэлл',
    genre: 'Фантастика',
    year: 1949,
    description: 'Антиутопия о тоталитарном обществе будущего, где правит Большой Брат и контролируется каждый шаг граждан. Роман-предупреждение о диктатуре.',
  },
  {
    id: '5',
    title: 'Гарри Поттер и философский камень',
    author: 'Дж. К. Роулинг',
    genre: 'Фэнтези',
    year: 1997,
    description: 'Первая книга о мальчике-волшебнике, который узнаёт о своём магическом наследии и поступает в школу чародейства и волшебства Хогвартс.',
  },
  {
    id: '6',
    title: 'Убить пересмешника',
    author: 'Харпер Ли',
    genre: 'Драма',
    year: 1960,
    description: 'История о расовой несправедливости в американском городке, рассказанная глазами маленькой девочки. Классика о морали и человечности.',
  },
  {
    id: '7',
    title: 'Граф Монте-Кристо',
    author: 'Александр Дюма',
    genre: 'Приключения',
    year: 1844,
    description: 'Захватывающая история о моряке Эдмоне Дантесе, который был предан друзьями и провёл годы в тюрьме, а затем вернулся, чтобы отомстить.',
  },
  {
    id: '8',
    title: 'Анна Каренина',
    author: 'Лев Толстой',
    genre: 'Классика',
    year: 1877,
    description: 'Роман о трагической любви замужней женщины и офицера, на фоне картины русского общества второй половины XIX века.',
  },
];

const ALL_GENRES = Array.from(new Set(SAMPLE_BOOKS.map(book => book.genre)));

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

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

  const filteredBooks = SAMPLE_BOOKS.filter(book => {
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === null || book.genre === selectedGenre;
    const matchesBookmark = activeTab !== 'bookmarks' || bookmarks.has(book.id);
    
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
          {SAMPLE_BOOKS.slice(0, 4).map(book => (
            <BookCard
              key={book.id}
              {...book}
              isBookmarked={bookmarks.has(book.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
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
      
      <SearchBar onSearch={setSearchQuery} />
      
      <GenreFilter
        genres={ALL_GENRES}
        selectedGenre={selectedGenre}
        onGenreSelect={setSelectedGenre}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <BookCard
              key={book.id}
              {...book}
              isBookmarked={bookmarks.has(book.id)}
              onToggleBookmark={handleToggleBookmark}
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
        {ALL_GENRES.map(genre => {
          const genreBooks = SAMPLE_BOOKS.filter(b => b.genre === genre);
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
          {SAMPLE_BOOKS.filter(book => bookmarks.has(book.id)).map(book => (
            <BookCard
              key={book.id}
              {...book}
              isBookmarked={true}
              onToggleBookmark={handleToggleBookmark}
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
        {renderContent()}
      </main>

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
