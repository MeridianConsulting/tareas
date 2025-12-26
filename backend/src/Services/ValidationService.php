<?php

namespace App\Services;

class ValidationService
{
  /**
   * Validar email
   */
  public static function validateEmail(string $email): bool
  {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
  }

  /**
   * Validar que un string no esté vacío
   */
  public static function validateRequired($value): bool
  {
    if (is_string($value)) {
      return trim($value) !== '';
    }
    return $value !== null && $value !== '';
  }

  /**
   * Validar longitud de string
   */
  public static function validateLength(string $value, int $min = null, int $max = null): bool
  {
    $length = mb_strlen($value);
    if ($min !== null && $length < $min) {
      return false;
    }
    if ($max !== null && $length > $max) {
      return false;
    }
    return true;
  }

  /**
   * Validar que sea un entero positivo
   */
  public static function validatePositiveInteger($value): bool
  {
    return is_numeric($value) && (int)$value > 0;
  }

  /**
   * Validar que sea un entero no negativo
   */
  public static function validateNonNegativeInteger($value): bool
  {
    return is_numeric($value) && (int)$value >= 0;
  }

  /**
   * Validar rango numérico
   */
  public static function validateRange($value, $min = null, $max = null): bool
  {
    if (!is_numeric($value)) {
      return false;
    }
    $num = (float)$value;
    if ($min !== null && $num < $min) {
      return false;
    }
    if ($max !== null && $num > $max) {
      return false;
    }
    return true;
  }

  /**
   * Validar fecha en formato YYYY-MM-DD
   */
  public static function validateDate(string $date): bool
  {
    $d = \DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
  }

  /**
   * Validar que una fecha sea posterior a otra
   */
  public static function validateDateAfter(string $date, string $afterDate): bool
  {
    $date1 = \DateTime::createFromFormat('Y-m-d', $date);
    $date2 = \DateTime::createFromFormat('Y-m-d', $afterDate);
    
    if (!$date1 || !$date2) {
      return false;
    }
    
    return $date1 > $date2;
  }

  /**
   * Validar que un valor esté en una lista de valores permitidos
   */
  public static function validateIn($value, array $allowed): bool
  {
    return in_array($value, $allowed, true);
  }

  /**
   * Sanitizar string (remover tags HTML y espacios)
   */
  public static function sanitizeString(string $value): string
  {
    $value = trim($value);
    $value = strip_tags($value);
    return $value;
  }

  /**
   * Validar y sanitizar email
   */
  public static function sanitizeEmail(string $email): ?string
  {
    $email = trim(strtolower($email));
    if (!self::validateEmail($email)) {
      return null;
    }
    return $email;
  }

  /**
   * Validar estructura de datos de tarea
   */
  public static function validateTaskData(array $data): array
  {
    $errors = [];

    // Título (requerido, 1-255 caracteres)
    if (!isset($data['title']) || !self::validateRequired($data['title'])) {
      $errors['title'] = 'El título es requerido';
    } elseif (!self::validateLength($data['title'], 1, 255)) {
      $errors['title'] = 'El título debe tener entre 1 y 255 caracteres';
    }

    // Tipo (requerido, valores permitidos)
    $allowedTypes = ['Clave', 'Operativa', 'Mejora', 'Obligatoria'];
    if (!isset($data['type']) || !self::validateIn($data['type'], $allowedTypes)) {
      $errors['type'] = 'El tipo debe ser uno de: ' . implode(', ', $allowedTypes);
    }

    // Prioridad (requerido, valores permitidos)
    $allowedPriorities = ['Alta', 'Media', 'Baja'];
    if (!isset($data['priority']) || !self::validateIn($data['priority'], $allowedPriorities)) {
      $errors['priority'] = 'La prioridad debe ser una de: ' . implode(', ', $allowedPriorities);
    }

    // Estado (requerido, valores permitidos)
    $allowedStatuses = ['No iniciada', 'En progreso', 'En revision', 'Completada', 'En riesgo'];
    if (!isset($data['status']) || !self::validateIn($data['status'], $allowedStatuses)) {
      $errors['status'] = 'El estado debe ser uno de: ' . implode(', ', $allowedStatuses);
    }

    // Progreso (0-100)
    if (isset($data['progress_percent'])) {
      if (!self::validateRange($data['progress_percent'], 0, 100)) {
        $errors['progress_percent'] = 'El progreso debe estar entre 0 y 100';
      }
    }

    // Área (requerido, entero positivo)
    if (!isset($data['area_id']) || !self::validatePositiveInteger($data['area_id'])) {
      $errors['area_id'] = 'El área es requerida y debe ser un ID válido';
    }

    // Responsable (opcional, pero si está presente debe ser entero positivo)
    if (isset($data['responsible_id']) && $data['responsible_id'] !== '' && !self::validatePositiveInteger($data['responsible_id'])) {
      $errors['responsible_id'] = 'El responsable debe ser un ID válido';
    }

    // Fechas (opcionales, pero si están deben ser válidas)
    if (isset($data['start_date']) && $data['start_date'] !== '' && !self::validateDate($data['start_date'])) {
      $errors['start_date'] = 'La fecha de inicio debe estar en formato YYYY-MM-DD';
    }

    if (isset($data['due_date']) && $data['due_date'] !== '' && !self::validateDate($data['due_date'])) {
      $errors['due_date'] = 'La fecha de vencimiento debe estar en formato YYYY-MM-DD';
    }

    // Validar que due_date sea posterior a start_date si ambas están presentes
    if (isset($data['start_date']) && isset($data['due_date']) && 
        $data['start_date'] !== '' && $data['due_date'] !== '' &&
        self::validateDate($data['start_date']) && self::validateDate($data['due_date'])) {
      if (!self::validateDateAfter($data['due_date'], $data['start_date'])) {
        $errors['due_date'] = 'La fecha de vencimiento debe ser posterior a la fecha de inicio';
      }
    }

    return $errors;
  }

  /**
   * Validar datos de usuario
   */
  public static function validateUserData(array $data, bool $isUpdate = false): array
  {
    $errors = [];

    // Nombre (requerido, 1-100 caracteres)
    if (!$isUpdate || isset($data['name'])) {
      if (!isset($data['name']) || !self::validateRequired($data['name'])) {
        $errors['name'] = 'El nombre es requerido';
      } elseif (!self::validateLength($data['name'], 1, 100)) {
        $errors['name'] = 'El nombre debe tener entre 1 y 100 caracteres';
      }
    }

    // Email (requerido, formato válido)
    if (!$isUpdate || isset($data['email'])) {
      if (!isset($data['email']) || !self::validateRequired($data['email'])) {
        $errors['email'] = 'El email es requerido';
      } elseif (!self::validateEmail($data['email'])) {
        $errors['email'] = 'El email no tiene un formato válido';
      }
    }

    // Password (requerido solo en creación, mínimo 6 caracteres)
    if (!$isUpdate) {
      if (!isset($data['password']) || !self::validateRequired($data['password'])) {
        $errors['password'] = 'La contraseña es requerida';
      } elseif (!self::validateLength($data['password'], 6)) {
        $errors['password'] = 'La contraseña debe tener al menos 6 caracteres';
      }
    } elseif (isset($data['password']) && $data['password'] !== '') {
      // Si se actualiza y se proporciona password, validar
      if (!self::validateLength($data['password'], 6)) {
        $errors['password'] = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    // Role ID (requerido, entero positivo)
    if (!$isUpdate || isset($data['role_id'])) {
      if (!isset($data['role_id']) || !self::validatePositiveInteger($data['role_id'])) {
        $errors['role_id'] = 'El rol es requerido y debe ser un ID válido';
      }
    }

    // Area ID (opcional, pero si está presente debe ser entero positivo)
    if (isset($data['area_id']) && $data['area_id'] !== '' && !self::validatePositiveInteger($data['area_id'])) {
      $errors['area_id'] = 'El área debe ser un ID válido';
    }

    return $errors;
  }

  /**
   * Validar datos de área
   */
  public static function validateAreaData(array $data): array
  {
    $errors = [];

    // Nombre (requerido, 1-100 caracteres)
    if (!isset($data['name']) || !self::validateRequired($data['name'])) {
      $errors['name'] = 'El nombre es requerido';
    } elseif (!self::validateLength($data['name'], 1, 100)) {
      $errors['name'] = 'El nombre debe tener entre 1 y 100 caracteres';
    }

    // Código (requerido, 1-50 caracteres)
    if (!isset($data['code']) || !self::validateRequired($data['code'])) {
      $errors['code'] = 'El código es requerido';
    } elseif (!self::validateLength($data['code'], 1, 50)) {
      $errors['code'] = 'El código debe tener entre 1 y 50 caracteres';
    }

    // Tipo (requerido, valores permitidos)
    $allowedTypes = ['AREA', 'PROYECTO'];
    if (!isset($data['type']) || !self::validateIn($data['type'], $allowedTypes)) {
      $errors['type'] = 'El tipo debe ser AREA o PROYECTO';
    }

    // Parent ID (opcional, pero si está presente debe ser entero positivo)
    if (isset($data['parent_id']) && $data['parent_id'] !== '' && !self::validatePositiveInteger($data['parent_id'])) {
      $errors['parent_id'] = 'El área padre debe ser un ID válido';
    }

    return $errors;
  }
}

