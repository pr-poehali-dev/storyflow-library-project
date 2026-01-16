import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  description: string;
  coverUrl?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onRead?: (id: string) => void;
  onDetails?: (id: string) => void;
}

export default function BookCard({
  id,
  title,
  author,
  genre,
  year,
  description,
  coverUrl,
  isBookmarked = false,
  onToggleBookmark,
  onRead,
  onDetails,
}: BookCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmarkClick = () => {
    setBookmarked(!bookmarked);
    onToggleBookmark?.(id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in group">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="w-full sm:w-32 h-48 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-accent">
              <Icon name="BookOpen" size={48} className="text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-serif font-bold text-lg text-foreground leading-tight">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {author} • {year}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmarkClick}
              className="flex-shrink-0"
            >
              <Icon 
                name={bookmarked ? "Bookmark" : "BookmarkPlus"} 
                size={20}
                className={bookmarked ? "fill-primary" : ""}
              />
            </Button>
          </div>

          <Badge variant="secondary" className="w-fit">
            {genre}
          </Badge>

          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {description}
          </p>

          <div className="flex gap-2 mt-auto">
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2"
              onClick={() => onRead?.(id)}
            >
              <Icon name="Book" size={16} />
              Читать
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => onDetails?.(id)}
            >
              <Icon name="Info" size={16} />
              Подробнее
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}