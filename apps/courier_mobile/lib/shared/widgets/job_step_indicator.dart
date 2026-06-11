import 'package:flutter/material.dart';
import '../../core/jobs/job_workflow.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class JobStepIndicator extends StatelessWidget {
  const JobStepIndicator({super.key, required this.steps});

  final List<JobWorkflowStep> steps;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < steps.length; i++) ...[
          if (i > 0)
            Expanded(
              child: Container(
                height: 2,
                margin: const EdgeInsets.only(bottom: 18),
                color: steps[i].isComplete || steps[i].isCurrent
                    ? AppColors.primary
                    : AppColors.border,
              ),
            ),
          _StepDot(step: steps[i]),
        ],
      ],
    );
  }
}

class _StepDot extends StatelessWidget {
  const _StepDot({required this.step});

  final JobWorkflowStep step;

  @override
  Widget build(BuildContext context) {
    final color = step.isComplete
        ? AppColors.success
        : step.isCurrent
            ? AppColors.primary
            : AppColors.border;

    return SizedBox(
      width: 56,
      child: Column(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: step.isCurrent ? AppColors.primarySoft : AppColors.surfaceElevated,
              border: Border.all(color: color, width: 2),
            ),
            child: step.isComplete
                ? const Icon(Icons.check, size: 14, color: AppColors.success)
                : null,
          ),
          const SizedBox(height: 6),
          Text(
            step.label,
            style: AppTypography.caption.copyWith(
              color: step.isCurrent ? AppColors.textPrimary : AppColors.textMuted,
              fontWeight: step.isCurrent ? FontWeight.w700 : FontWeight.w500,
              fontSize: 9,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
          ),
        ],
      ),
    );
  }
}
