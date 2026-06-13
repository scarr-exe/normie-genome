type LiveFieldProps = {
  label: string;
  value: string | number;
};

export function LiveField({ label, value }: LiveFieldProps) {
  return (
    <div className="live-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

