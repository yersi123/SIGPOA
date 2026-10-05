<?php

namespace App\Enums;

enum EstadoGestion: string
{
    case Abierta = 'abierta';
    case Cerrada = 'cerrada';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::Abierta => 'Abierta',
            self::Cerrada => 'Cerrada',
        };
    }
}
