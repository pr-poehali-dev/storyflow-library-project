import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface BookDetailsProps {
  bookId: string | null;
  open: boolean;
  onClose: () => void;
  onRead: () => void;
}

export default function BookDetails({ bookId, open, onClose, onRead }: BookDetailsProps) {
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bookId && open) {
      setLoading(true);
      fetch(`https://functions.poehali.dev/bd6a2732-86ce-4673-a032-4d305f7946ef?id=${bookId}`)
        .then(res => res.json())
        .then(data => {
          setBook(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [bookId, open]);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">{book.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="User" size={18} />
              <span>{book.author}</span>
            </div>
            {book.year && (
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={18} />
                <span>{book.year}</span>
              </div>
            )}
          </div>

          {book.genre && (
            <div>
              <Badge variant="secondary" className="text-base px-4 py-1">
                {book.genre}
              </Badge>
            </div>
          )}

          {book.description && (
            <div>
              <h3 className="font-serif font-bold text-lg mb-2">Описание</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.description}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={onRead} className="gap-2 flex-1">
              <Icon name="Book" size={18} />
              Читать книгу
            </Button>
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
