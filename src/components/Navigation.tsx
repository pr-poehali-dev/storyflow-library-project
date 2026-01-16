import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'catalog', label: 'Каталог', icon: 'Library' },
    { id: 'genres', label: 'Жанры', icon: 'Tags' },
    { id: 'bookmarks', label: 'Закладки', icon: 'Bookmark' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Icon name="BookOpen" size={24} className="text-primary-foreground" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-foreground">
              StoryFlow
            </h1>
          </div>

          <div className="hidden md:flex gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => onTabChange(tab.id)}
                className="gap-2"
              >
                <Icon name={tab.icon as any} size={18} />
                {tab.label}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="icon" className="md:hidden">
            <Icon name="Menu" size={24} />
          </Button>
        </div>

        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className="gap-2 whitespace-nowrap"
            >
              <Icon name={tab.icon as any} size={16} />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
