<?php

namespace App\Enums;

enum EstadoContratacion: string
{
    case Solicitud = 'solicitud';
    case Cotizacion = 'cotizacion';
    case Adjudicada = 'adjudicada';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::Solicitud => 'Solicitud',
            self::Cotizacion => 'Cotizacion',
            self::Adjudicada => 'Adjudicada',
        };
    }

    public function siguiente(): ?self
    {
        return match ($this) {
            self::Solicitud => self::Cotizacion,
            self::Cotizacion => self::Adjudicada,
            self::Adjudicada => null,
        };
    }
}
