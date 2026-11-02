import { initials, cn } from '../../lib/utils';

export function Avatar({ username, large = false }: { username: string; large?: boolean }) {
  const color = [...username].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5;
  return (
    <span aria-hidden="true" className={cn('avatar', `avatar-${color}`, large && 'avatar-large')}>
      {initials(username)}
    </span>
  );
}
