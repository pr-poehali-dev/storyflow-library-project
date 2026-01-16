import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Поиск по названию, автору или ключевым словам..." }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base bg-card shadow-sm"
          />
        </div>
        <Button 
          type="submit" 
          size="lg"
          className="px-6"
        >
          Найти
        </Button>
      </div>
    </form>
  );
}
