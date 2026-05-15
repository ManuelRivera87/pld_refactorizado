type FormErrorProps = {
  message: string;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="form-error" role="alert">
      {message}
    </div>
  );
}
