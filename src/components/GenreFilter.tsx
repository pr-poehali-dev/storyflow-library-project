import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GenreFilterProps {
  genres: string[];
  selectedGenre: string | null;
  onGenreSelect: (genre: string | null) => void;
}

export default function GenreFilter({ genres, selectedGenre, onGenreSelect }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedGenre === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onGenreSelect(null)}
        className="rounded-full"
      >
        Все жанры
      </Button>
      {genres.map((genre) => (
        <Button
          key={genre}
          variant={selectedGenre === genre ? 'default' : 'outline'}
          size="sm"
          onClick={() => onGenreSelect(genre)}
          className="rounded-full"
        >
          {genre}
        </Button>
      ))}
    </div>
  );
}
