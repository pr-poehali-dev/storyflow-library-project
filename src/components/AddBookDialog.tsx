import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AddBookDialogProps {
  onBookAdded: () => void;
}

export default function AddBookDialog({ onBookAdded }: AddBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    year: '',
    description: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/bd6a2732-86ce-4673-a032-4d305f7946ef', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? parseInt(formData.year) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: 'Книга успешно добавлена в библиотеку',
        });
        setFormData({
          title: '',
          author: '',
          genre: '',
          year: '',
          description: '',
          content: '',
        });
        setOpen(false);
        onBookAdded();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить книгу',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при добавлении книги',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="lg">
          <Icon name="Plus" size={20} />
          Добавить книгу
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Добавить новую книгу</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название книги *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название книги"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Автор *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Введите имя автора"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Жанр</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Например: Классика"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Год издания</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Краткое описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание книги для карточки"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Текст книги *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Вставьте полный текст книги сюда..."
              rows={10}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Добавление...
                </>
              ) : (
                <>
                  <Icon name="Check" size={16} />
                  Добавить книгу
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
