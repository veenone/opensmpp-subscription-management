import React from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility, VisibilityOff, Info } from '@mui/icons-material';

interface FormTextFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
  extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText'> {
  name: TName;
  control: Control<TFieldValues>;
  rules?: any;
  helpText?: string;
  showPassword?: boolean;
}

export const FormTextField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  control,
  rules,
  helpText,
  showPassword = false,
  type,
  InputProps,
  ...textFieldProps
}: FormTextFieldProps<TFieldValues, TName>) => {
  const [showPasswordValue, setShowPasswordValue] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPasswordValue(!showPasswordValue);
  };

  const isPasswordField = type === 'password';
  const actualType = isPasswordField && showPasswordValue ? 'text' : type;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <TextField
          {...textFieldProps}
          inputRef={ref}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          error={!!error}
          helperText={error?.message || helpText}
          type={actualType}
          InputProps={{
            ...InputProps,
            endAdornment: (
              <>
                {isPasswordField && showPassword && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
                    >
                      {showPasswordValue ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )}
                {helpText && !error && (
                  <InputAdornment position="end">
                    <Tooltip title={helpText} arrow>
                      <Info color="action" fontSize="small" />
                    </Tooltip>
                  </InputAdornment>
                )}
                {InputProps?.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};