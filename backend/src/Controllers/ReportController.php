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
    $dateFrom = $request->getQuery('date_from');
    $dateTo = $request->getQuery('date_to');
    
    $report = $this->reportService->getManagementReport($dateFrom, $dateTo);

    return Response::json([
      'data' => $report
    ]);
  }

  public function weeklyEvolution(Request $request)
  {
    $data = $this->reportService->getWeeklyEvolution();

    return Response::json([
      'data' => $data
    ]);
  }

  public function quarterlyCompliance(Request $request)
  {
    $data = $this->reportService->getQuarterlyCompliance();

    return Response::json([
      'data' => $data
    ]);
  }

  public function advancedStats(Request $request)
  {
    $data = $this->reportService->getAdvancedStats();

    return Response::json([
      'data' => $data
    ]);
  }
}

