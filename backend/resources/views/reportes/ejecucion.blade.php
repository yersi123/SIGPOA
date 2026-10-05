<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Ejecucion presupuestaria</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #111; }
        h1 { font-size: 15px; margin: 0 0 2px; }
        .sub { color: #555; margin: 0 0 10px; }
        .totales { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .totales td { border: 1px solid #999; padding: 4px 6px; }
        .totales td.etq { background: #eee; font-weight: bold; width: 30%; }
        table.datos { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        table.datos th { background: #ddd; border: 1px solid #999; padding: 4px; text-align: left; }
        table.datos td { border: 1px solid #ccc; padding: 3px 4px; }
        .num { text-align: right; }
        .alerta { color: #a00; font-weight: bold; }
        h2 { font-size: 12px; margin: 10px 0 4px; }
    </style>
</head>
<body>
    <h1>Reporte de ejecucion presupuestaria</h1>
    <p class="sub">
        Gestion {{ $gestion->anio }} ({{ $gestion->estado }})
        &middot; generado el {{ now()->format('d/m/Y H:i') }}
    </p>

    <table class="totales">
        <tr><td class="etq">Presupuesto total</td><td class="num">{{ number_format($resumen['presupuesto_total'], 2) }}</td></tr>
        <tr><td class="etq">Total ejecutado</td><td class="num">{{ number_format($resumen['total_ejecutado'], 2) }}</td></tr>
        <tr><td class="etq">Saldo</td><td class="num">{{ number_format($resumen['saldo'], 2) }}</td></tr>
        <tr><td class="etq">% Ejecucion</td><td class="num">{{ $resumen['porcentaje_ejecucion'] }} %</td></tr>
        <tr><td class="etq">Actividades sobreejecutadas</td><td class="num">{{ $resumen['actividades_sobreejecutadas'] }}</td></tr>
    </table>

    <h2>Ejecucion por unidad</h2>
    <table class="datos">
        <thead>
            <tr><th>Unidad</th><th class="num">Programado</th><th class="num">Ejecutado</th><th class="num">Saldo</th><th class="num">%</th></tr>
        </thead>
        <tbody>
        @foreach ($unidades as $u)
            <tr>
                <td>{{ $u->unidad }}</td>
                <td class="num">{{ number_format((float) $u->monto_programado, 2) }}</td>
                <td class="num">{{ number_format((float) $u->monto_ejecutado, 2) }}</td>
                <td class="num">{{ number_format((float) $u->saldo, 2) }}</td>
                <td class="num">{{ $u->porcentaje_ejecucion }} %</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <h2>Ejecucion por organizacion</h2>
    <table class="datos">
        <thead>
            <tr><th>Organizacion</th><th>Tipo</th><th class="num">Programado</th><th class="num">Ejecutado</th><th class="num">%</th></tr>
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
        <h2>Actividades sobreejecutadas</h2>
        <table class="datos">
            <thead>
                <tr><th>ID</th><th>Objetivo</th><th class="num">Programado</th><th class="num">Ejecutado</th><th class="num">Exceso</th></tr>
            </thead>
            <tbody>
            @foreach ($alertas as $a)
                <tr class="alerta">
                    <td>{{ $a->actividad_id }}</td>
                    <td>{{ $a->objetivo }}</td>
                    <td class="num">{{ number_format((float) $a->monto_programado, 2) }}</td>
                    <td class="num">{{ number_format((float) $a->monto_ejecutado, 2) }}</td>
                    <td class="num">{{ number_format((float) $a->exceso, 2) }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>