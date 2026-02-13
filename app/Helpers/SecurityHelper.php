<?php

namespace App\Helpers;

class SecurityHelper
{
    /**
     * Sanitize HTML content, allowing only a safe subset of tags.
     * Useful for rich text content while preventing XSS.
     *
     * @param string|null $content
     * @return string|null
     */
    public static function sanitizeHtml(?string $content): ?string
    {
        if (is_null($content)) {
            return null;
        }

        // Allowed tags for rich text
        $allowedTags = '<p><br><strong><em><ul><ol><li><a><b><i><u>';

        // Strip tags not in the allowed list
        $sanitized = strip_tags($content, $allowedTags);

        // Remove dangerous attributes like onmouseover, onclick, etc.
        $sanitized = preg_replace('/on\w+="[^"]*"/i', '', $sanitized);
        $sanitized = preg_replace('/on\w+=\'[^\']*\'/i', '', $sanitized);
        $sanitized = preg_replace('/javascript:[^"\']*/i', '', $sanitized);

        return $sanitized;
    }
}
