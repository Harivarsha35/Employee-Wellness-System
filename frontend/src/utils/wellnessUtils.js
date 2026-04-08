/**
 * Wellness calculation utility to ensure consistency across Employee, HR, and Admin dashboards.
 * 
 * Logic based on Employee Dashboard (Dashboard.jsx):
 * - Sleep Target: >= 6 hrs
 * - Water Target: >= 5 L
 * - Stress Target: <= 3 / 5
 * - BMI Target: "Normal weight"
 * 
 * Status Thresholds:
 * - Healthy: Score >= 3
 * - Balanced: Score 2
 * - At Risk: Score <= 1 OR (Sleep < 5 OR Stress > 4.5)
 */

export const calculateWellness = (activities, bmiCategory) => {
    const count = activities.length;
    if (count === 0) return { status: 'N/A', color: '#aaa', icon: '📝', score: 0 };

    const avgSleep = activities.reduce((acc, curr) => acc + curr.sleepHours, 0) / count;
    const avgWater = activities.reduce((acc, curr) => acc + curr.waterIntake, 0) / count;
    const avgStress = activities.reduce((acc, curr) => acc + (Number(curr.stressLevel) || 5), 0) / count;

    // Score each metric (1 point each = 4 total)
    let score = 0;
    if (avgSleep >= 6) score++;                                            // Good sleep
    if (avgWater >= 5) score++;                                             // Good hydration
    if (avgStress <= 3) score++;                                           // Low stress
    if (bmiCategory === 'Normal weight') score++;                          // Healthy BMI
    else if (bmiCategory === 'Obese') score -= 1;                         // Penalise for Obese

    // Critical override: very poor sleep or very high stress = Need Rest
    const isCritical = avgSleep < 5 || avgStress > 4.5;

    let status = 'Balanced';
    let color = '#f39c12';
    let icon = '⚖️';

    if (isCritical || score <= 1) {
        status = 'At Risk';
        color = '#e74c3c';
        icon = '😴';
    } else if (score >= 3) {
        status = 'Healthy';
        color = '#27ae60';
        icon = '😇';
    }

    return {
        status,
        color,
        icon,
        score,
        avgSleep: avgSleep.toFixed(1),
        avgWater: avgWater.toFixed(1),
        avgStress: avgStress.toFixed(1),
        isCritical
    };
};
