import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface BookReaderProps {
  bookId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function BookReader({ bookId, open, onClose }: BookReaderProps) {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="font-serif text-2xl mb-2">
                {loading ? 'Загрузка...' : book?.title || 'Книга'}
              </DialogTitle>
              {book && (
                <p className="text-sm text-muted-foreground">
                  {book.author} • {book.year}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
            </div>
          ) : book ? (
            <div className="prose prose-sm max-w-none pr-4">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {book.content}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Не удалось загрузить книгу
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
