<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\ReportService;

class ReportController
{
  private $reportService;

  public function __construct()
  {
    $this->reportService = new ReportService();
  }

  public function daily(Request $request)
  {
    $userContext = $request->getAttribute('userContext');
    $date = $request->getQuery('date');
    $areaId = $request->getQuery('area_id') ? (int)$request->getQuery('area_id') : null;

    $report = $this->reportService->getDailyReport($date, $areaId, $userContext);

    return Response::json([
      'data' => $report
    ]);
  }

  public function management(Request $request)
  {
    $report = $this->reportService->getManagementReport();

    return Response::json([
      'data' => $report
    ]);
  }
}

