import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Eye, EyeOff, Lock } from "lucide-react";

export function PasswordInput({
  field,
  isInvalid,
}: {
  isInvalid: boolean;
  field: {
    name: string;
    state: {
      value: string;
    };
    handleChange: (value: string) => void;
    handleBlur: () => void;
  };
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="Введите пароль"
        autoComplete="current-password"
        type={showPassword ? "text" : "password"}
      />
      <InputGroupAddon>
        <Lock className="text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupButton
        aria-label="show-password"
        title="show-password"
        size="icon-xs"
        className="mr-2"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? (
          <Eye className="text-muted-foreground" />
        ) : (
          <EyeOff className="text-muted-foreground" />
        )}
      </InputGroupButton>
    </InputGroup>
  );
}
