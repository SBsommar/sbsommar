<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Thrown by the add flow when the target fragment already exists on main — i.e.
 * the same activity (same title + date + start) is already in the schedule. The
 * HTTP layer maps this to 409 with a clear Swedish message instead of a generic
 * write-conflict 500 (02-§110.2).
 */
final class DuplicateEventException extends \RuntimeException
{
}
