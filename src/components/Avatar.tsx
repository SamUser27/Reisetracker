function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  color,
  size = 32,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      title={name}
      className="inline-flex items-center justify-center rounded-full font-medium text-white shrink-0"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  people,
}: {
  people: { id: string; name: string; colorTag: string }[];
}) {
  return (
    <div className="flex -space-x-2">
      {people.map((person) => (
        <span
          key={person.id}
          className="ring-2"
          style={{ borderRadius: "999px", ["--tw-ring-color" as string]: "var(--surface-2)" }}
        >
          <Avatar name={person.name} color={person.colorTag} />
        </span>
      ))}
    </div>
  );
}
