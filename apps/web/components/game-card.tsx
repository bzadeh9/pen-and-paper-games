import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface GameCardProps {
  name: string;
  description: string;
  href: string;
}

export function GameCard({ name, description, href }: GameCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full transition-all duration-300 hover:border-foreground/40 hover:shadow-lg group-hover:border-foreground/40">
        <CardHeader>
          <CardTitle className="group-hover:text-primary transition-colors">{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
