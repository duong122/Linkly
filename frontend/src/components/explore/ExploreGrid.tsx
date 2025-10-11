import { Card } from '../../components/ui/card';

const exploreItems = [
  {
    id: '1',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_1.png',
    alt: 'people sharing moments',
    likes: 234,
  },
  {
    id: '2',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_2.png',
    alt: 'creative background shapes',
    likes: 189,
  },
  {
    id: '3',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_3.png',
    alt: 'digital communication concept',
    likes: 312,
  },
  {
    id: '4',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_4.png',
    alt: 'community feed inspiration',
    likes: 276,
  },
  {
    id: '5',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_1.png',
    alt: 'people sharing moments',
    likes: 198,
  },
  {
    id: '6',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_2.png',
    alt: 'creative background shapes',
    likes: 245,
  },
];

export default function ExploreGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {exploreItems.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden cursor-pointer bg-card text-card-foreground border-border hover:shadow-lg transition-shadow duration-200"
        >
          <div className="relative aspect-square">
            <img
              src={item.image}
              alt={item.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <p className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.likes} likes
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
