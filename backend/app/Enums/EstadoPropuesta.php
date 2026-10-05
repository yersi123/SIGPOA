<?php

namespace App\Enums;

enum EstadoPropuesta: string
{
    case Propuesto = 'propuesto';
    case Aprobado = 'aprobado';
    case EnEjecucion = 'en_ejecucion';
    case Concluido = 'concluido';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::Propuesto => 'Propuesto',
            self::Aprobado => 'Aprobado',
            self::EnEjecucion => 'En Ejecucion',
            self::Concluido => 'Concluido',
        };
    }
}
