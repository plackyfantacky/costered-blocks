<?php
    use PHPUnit\Framework\TestCase;
    use Brain\Monkey;

    final class costered_build_css_pretty_for_selectors extends TestCase 
    {
        
        public function test_generates_expected_nested_media_block(): void 
        {

            //arrange
            $selector = '[data-costered="7862ad83-f17e-4677-8087-895808f1c433"]';

            $stylesByBreakpoint = array(
                'desktop' => array(
                    'margin-top' => '0rem',
                ),
                'tablet' => array(
                    'margin-top' => '-2rem',
                ),
                'mobile' => array(
                    'margin-top' => '0rem',
                ),
            );

            // Use the real helper to keep the test in sync with config.
            $breakpoints   = costered_get_breakpoints();
            $mobileMaxPx   = (int) ($breakpoints['mobile'] ?? 782);
            $tabletMaxPx   = (int) ($breakpoints['tablet'] ?? 1024);
            $tabletMinPx   = $mobileMaxPx + 1;
            

            //act
            $css = costered_build_css_pretty_for_selectors($selector, $stylesByBreakpoint, '');

            //assert
            $expected = <<<CSS
{$selector} {
    margin-top: 0rem;

    @media (min-width: {$tabletMinPx}px) and (max-width: {$tabletMaxPx}px) {
        margin-top: -2rem;
    }

    @media (max-width: {$mobileMaxPx}px) {
        margin-top: 0rem;
    }
}

CSS;

            $this->assertSame($expected, $css);
        }

    }