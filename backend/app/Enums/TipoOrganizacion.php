<?php

namespace App\Enums;

enum TipoOrganizacion: string
{
    case OTB = 'OTB';
    case Sindicato = 'sindicato';
    case JuntaVecinal = 'junta_vecinal';
    case PuebloIndigena = 'pueblo_indigena';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function fromLabel(string $valor): ?self
    {
        foreach (self::cases() as $caso) {
            if (mb_strtolower($caso->value) === mb_strtolower(trim($valor))) {
                return $caso;
            }
        }

        return null;
    }

    public function label(): string
    {
        return match ($this) {
            self::OTB => 'OTB',
            self::Sindicato => 'Sindicato',
            self::JuntaVecinal => 'Junta Vecinal',
            self::PuebloIndigena => 'Pueblo Indigena',
        };
    }
}
