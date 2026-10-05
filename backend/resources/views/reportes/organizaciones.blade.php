<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Ejecucion por organizacion</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #111; }
        h1 { font-size: 15px; margin: 0 0 2px; }
        .sub { color: #555; margin: 0 0 10px; }
        table.datos { width: 100%; border-collapse: collapse; }
        table.datos th { background: #ddd; border: 1px solid #999; padding: 4px; text-align: left; }
        table.datos td { border: 1px solid #ccc; padding: 3px 4px; }
        .num { text-align: right; }
        h2 { font-size: 12px; margin: 10px 0 4px; }
    </style>
</head>
<body>
    <h1>Ejecucion por organizacion</h1>
    <p class="sub">
        Gestion {{ $gestion->anio }} ({{ $gestion->estado }})
        &middot; generado el {{ now()->format('d/m/Y H:i') }}
    </p>

    <h2>Resumen</h2>
    <table class="datos">
        <thead>
            <tr><th>Indicador</th><th class="num">Valor</th></tr>
        </thead>
        <tbody>
            <tr><td>Presupuesto total</td><td class="num">{{ number_format($resumen['presupuesto_total'], 2) }}</td></tr>
            <tr><td>Total ejecutado</td><td class="num">{{ number_format($resumen['total_ejecutado'], 2) }}</td></tr>
            <tr><td>Saldo</td><td class="num">{{ number_format($resumen['saldo'], 2) }}</td></tr>
            <tr><td>% Ejecucion</td><td class="num">{{ $resumen['porcentaje_ejecucion'] }} %</td></tr>
        </tbody>
    </table>

    <h2>Detalle por organizacion</h2>
    <table class="datos">
        <thead>
            <tr><th>Organizacion</th><th>Tipo</th><th class="num">Programado</th><th class="num">Ejecutado</th><th class="num">% Ejecucion</th></tr>
        </thead>
        <tbody>
        @foreach ($organizaciones as $o)
            <tr>
                <td>{{ $o->organizacion }}</td>
                <td>{{ $o->tipo }}</td>
                <td class="num">{{ number_format((float) $o->monto_programado, 2) }}</td>
                <td class="num">{{ number_format((float) $o->monto_ejecutado, 2) }}</td>
                <td class="num">{{ $o->porcentaje_ejecucion }} %</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    @if (count($alertas) > 0)
        <h2>Alertas</h2>
        <table class="datos">
            <thead>
                <tr><th>Actividad</th><th>Objetivo</th><th class="num">Exceso</th></tr>
            </thead>
            <tbody>
            @foreach ($alertas as $a)
                <tr>
                    <td>{{ $a->actividad_id }}</td>
                    <td>{{ $a->objetivo }}</td>
                    <td class="num">{{ number_format((float) $a->exceso, 2) }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>