interface Props { message: string; }

export function FieldError({ message }: Props) {
    return <p className="text-[0.7rem] text-destructive m-0">{message}</p>;
}
