import { Card } from '@/components/ui/card';

const savedPosts = [
  { id: '1', image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_3.png', alt: 'digital communication concept' },
  { id: '2', image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_4.png', alt: 'community feed inspiration' },
  { id: '3', image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_1.png', alt: 'people sharing moments' },
  { id: '4', image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_2.png', alt: 'creative background shapes' },
];

export default function SavedPosts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedPosts.map((post) => (
        <Card
          key={post.id}
          className="group overflow-hidden cursor-pointer bg-card text-card-foreground border-border hover:shadow-lg transition-shadow duration-200"
        >
          <div className="relative aspect-square">
            <img
              src={post.image}
              alt={post.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
