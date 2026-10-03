import unittest

from yogi_calculations import calculate_yogi_points, describe_sidereal_arcseconds


class SiderealPointBoundaryTests(unittest.TestCase):
    def test_zero_and_full_circle_map_to_aries_ashwini(self):
        for arcseconds in (0, 1_296_000):
            with self.subTest(arcseconds=arcseconds):
                point = describe_sidereal_arcseconds(arcseconds)
                self.assertEqual(point['point']['dms'], '0°00′00″')
                self.assertEqual(point['sign']['name'], 'Aries')
                self.assertEqual(point['nakshatra']['name'], 'Ashwini')
                self.assertEqual(point['nakshatra']['lord'], 'Ketu')

    def test_nakshatra_boundaries_belong_to_the_following_nakshatra(self):
        cases = (
            (48_000, 'Bharani', 'Venus'),
            (96_000, 'Krittika', 'Sun'),
        )
        for arcseconds, expected_nakshatra, expected_lord in cases:
            with self.subTest(arcseconds=arcseconds):
                point = describe_sidereal_arcseconds(arcseconds)
                self.assertEqual(point['nakshatra']['name'], expected_nakshatra)
                self.assertEqual(point['nakshatra']['lord'], expected_lord)

    def test_value_just_before_boundary_is_not_rounded_forward(self):
        point = describe_sidereal_arcseconds('47999.999')
        self.assertEqual(point['nakshatra']['name'], 'Ashwini')
        self.assertEqual(point['nakshatra']['lord'], 'Ketu')

    def test_thirty_degree_sign_boundary_belongs_to_taurus(self):
        point = describe_sidereal_arcseconds(108_000)
        self.assertEqual(point['point']['dms'], '30°00′00″')
        self.assertEqual(point['sign']['name'], 'Taurus')
        self.assertEqual(point['nakshatra']['name'], 'Krittika')


class YogiCalculationTests(unittest.TestCase):
    def test_points_and_corresponding_signs_nakshatras_and_lords(self):
        report = calculate_yogi_points('0', '0')
        self.assertEqual(report['yogiPoint']['dms'], '93°20′00″')
        self.assertEqual(report['yogiSign']['name'], 'Cancer')
        self.assertEqual(report['yogiNakshatra']['name'], 'Pushya')
        self.assertEqual(report['yogiNakshatra']['pada'], 1)
        self.assertEqual(report['yogiPlanet'], 'Saturn')
        self.assertEqual(report['avayogiPoint']['dms'], '280°00′00″')
        self.assertEqual(report['avayogiSign']['name'], 'Capricorn')
        self.assertEqual(report['avayogiNakshatra']['name'], 'Shravana')
        self.assertEqual(report['avayogiPlanet'], 'Moon')

    def test_yogi_point_wraps_at_360_degrees(self):
        report = calculate_yogi_points('300', '100')
        self.assertEqual(report['yogiPoint']['dms'], '133°20′00″')
        self.assertEqual(report['yogiSign']['name'], 'Leo')
        self.assertEqual(report['yogiNakshatra']['name'], 'Purva Phalguni')

    def test_yogi_and_duplicate_yogi_can_be_the_same_planet(self):
        report = calculate_yogi_points('120', '117')
        self.assertEqual(report['yogiPlanet'], 'Jupiter')
        self.assertEqual(report['duplicateYogi'], 'Jupiter')

    def test_duplicate_yogi_and_avayogi_can_be_the_same_planet(self):
        matching_report = None
        for moon_longitude in range(360):
            report = calculate_yogi_points('0', str(moon_longitude))
            if report['duplicateYogi'] == report['avayogiPlanet']:
                matching_report = report
                break

        self.assertIsNotNone(matching_report)
        self.assertEqual(
            matching_report['duplicateYogi'],
            matching_report['avayogiPlanet'],
        )


if __name__ == '__main__':
    unittest.main()