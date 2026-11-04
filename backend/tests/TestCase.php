<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Cache;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Clear cache so the throttle middleware's per-IP counter does not
        // leak between tests (PHPUnit runs them in the same process).
        Cache::flush();
    }
}
