import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { GameCategory, GameTag } from '@/config/games';

interface GameCardProps {
  name: string;
  description: string;
  href: string;
  category?: GameCategory;
  tags?: GameTag[];
}

export function GameCard({ name, description, href, category, tags }: GameCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full transition-all duration-300 hover:border-foreground/40 hover:shadow-lg group-hover:border-foreground/40">
        <CardHeader>
          <CardTitle className="group-hover:text-primary transition-colors">{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {(category || tags) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {category && (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {category}
                </span>
              )}
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-foreground/5 px-2 py-1 text-xs text-foreground/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
