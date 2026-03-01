import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FOOD_TYPE_LABELS, FOOD_TYPE_EMOJI, type FoodType } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface DeliveryCardProps {
  id: string;
  foodType: FoodType;
  description: string | null;
  amount: number;
  buildingWing: string;
  onAccept?: (id: string) => void;
  accepting?: boolean;
}

export function DeliveryCard({ id, foodType, description, amount, buildingWing, onAccept, accepting }: DeliveryCardProps) {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl sm:text-4xl shrink-0">{FOOD_TYPE_EMOJI[foodType]}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-[var(--foreground)] mb-1">
              {FOOD_TYPE_LABELS[foodType]}
            </h3>
            {description && (
              <p className="text-sm text-[var(--muted)] mt-1.5">{description}</p>
            )}
          </div>
        </div>
        <span className="text-xl sm:text-2xl font-bold text-[var(--success)] shrink-0">
          {formatCurrency(amount)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[var(--border)]">
        <Badge variant="info">
          {buildingWing}
        </Badge>
        {onAccept && (
          <Button
            size="sm"
            onClick={() => onAccept(id)}
            loading={accepting}
            className="w-full sm:w-auto"
          >
            Accept Delivery
          </Button>
        )}
      </div>
    </Card>
  );
}
