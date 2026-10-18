import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/order_model.dart';
import '../data/orders_repository.dart';
import 'order_detail_sheet.dart';

class OrdersFilter {
  const OrdersFilter({
    this.status,
    this.dateFrom,
    this.dateTo,
    this.search = '',
  });

  final String? status;
  final DateTime? dateFrom;
  final DateTime? dateTo;
  final String search;

  OrdersFilter copyWith({
    String? status,
    DateTime? dateFrom,
    DateTime? dateTo,
    String? search,
    bool clearStatus = false,
    bool clearDateFrom = false,
    bool clearDateTo = false,
  }) {
    return OrdersFilter(
      status: clearStatus ? null : (status ?? this.status),
      dateFrom: clearDateFrom ? null : (dateFrom ?? this.dateFrom),
      dateTo: clearDateTo ? null : (dateTo ?? this.dateTo),
      search: search ?? this.search,
    );
  }
}

class OrdersPagedState {
  const OrdersPagedState({
    required this.items,
    required this.page,
    required this.totalPages,
    this.loadingMore = false,
  });

  final List<ControlOrder> items;
  final int page;
  final int totalPages;
  final bool loadingMore;

  bool get hasMore => page < totalPages;
}

final ordersFilterProvider =
    StateProvider.autoDispose<OrdersFilter>((ref) => const OrdersFilter());

final ordersPagedProvider =
    AsyncNotifierProvider.autoDispose<OrdersPagedNotifier, OrdersPagedState>(
  OrdersPagedNotifier.new,
);

class OrdersPagedNotifier
    extends AutoDisposeAsyncNotifier<OrdersPagedState> {
  static const _limit = 20;

  Map<String, dynamic> _queryFrom(OrdersFilter f) {
    return {
      if (f.status != null && f.status!.isNotEmpty) 'status': f.status,
      if (f.dateFrom != null)
        'dateFrom': DateTime(
          f.dateFrom!.year,
          f.dateFrom!.month,
          f.dateFrom!.day,
        ).toUtc().toIso8601String(),
      if (f.dateTo != null)
        'dateTo': DateTime(
          f.dateTo!.year,
          f.dateTo!.month,
          f.dateTo!.day,
          23,
          59,
          59,
          999,
        ).toUtc().toIso8601String(),
      if (f.search.trim().isNotEmpty) 'search': f.search.trim(),
    };
  }

  @override
  Future<OrdersPagedState> build() async {
    final filter = ref.watch(ordersFilterProvider);
    final page = await ref.read(ordersRepositoryProvider).fetchOrders(
          page: 1,
          limit: _limit,
          query: _queryFrom(filter),
        );
    return OrdersPagedState(
      items: page.data,
      page: page.meta.page,
      totalPages: page.meta.totalPages,
    );
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore || current.loadingMore) return;

    state = AsyncData(
      OrdersPagedState(
        items: current.items,
        page: current.page,
        totalPages: current.totalPages,
        loadingMore: true,
      ),
    );

    try {
      final filter = ref.read(ordersFilterProvider);
      final nextPage = current.page + 1;
      final page = await ref.read(ordersRepositoryProvider).fetchOrders(
            page: nextPage,
            limit: _limit,
            query: _queryFrom(filter),
          );
      state = AsyncData(
        OrdersPagedState(
          items: [...current.items, ...page.data],
          page: page.meta.page,
          totalPages: page.meta.totalPages,
        ),
      );
    } catch (e) {
      state = AsyncData(
        OrdersPagedState(
          items: current.items,
          page: current.page,
          totalPages: current.totalPages,
        ),
      );
      rethrow;
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(build);
  }
}

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  late final TextEditingController _search;

  @override
  void initState() {
    super.initState();
    _search = TextEditingController();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _pickDate({required bool from}) async {
    final filter = ref.read(ordersFilterProvider);
    final initial = from ? filter.dateFrom : filter.dateTo;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 1)),
    );
    if (picked == null) return;
    final notifier = ref.read(ordersFilterProvider.notifier);
    notifier.state = from
        ? filter.copyWith(dateFrom: picked)
        : filter.copyWith(dateTo: picked);
  }

  String _dateLabel(DateTime? d) {
    if (d == null) return '—';
    return '${d.day.toString().padLeft(2, '0')}.'
        '${d.month.toString().padLeft(2, '0')}.'
        '${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(ordersFilterProvider);
    final async = ref.watch(ordersPagedProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.lg,
            AppSpacing.lg,
            0,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(AppStrings.ordersTitle, style: AppTypography.display),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: _search,
                decoration: InputDecoration(
                  labelText: AppStrings.orderSearchHint,
                  isDense: true,
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.search),
                    onPressed: () {
                      ref.read(ordersFilterProvider.notifier).state =
                          filter.copyWith(search: _search.text);
                    },
                  ),
                ),
                onSubmitted: (v) {
                  ref.read(ordersFilterProvider.notifier).state =
                      filter.copyWith(search: v);
                },
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String?>(
                value: filter.status,
                decoration: const InputDecoration(
                  labelText: AppStrings.orderStatus,
                  isDense: true,
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem<String?>(
                    value: null,
                    child: Text(AppStrings.allStatuses),
                  ),
                  for (final s in ControlOrder.statusOptions)
                    DropdownMenuItem<String?>(value: s, child: Text(s)),
                ],
                onChanged: (v) {
                  ref.read(ordersFilterProvider.notifier).state =
                      filter.copyWith(status: v, clearStatus: v == null);
                },
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _pickDate(from: true),
                      child: Text('${AppStrings.dateFrom}: ${_dateLabel(filter.dateFrom)}'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _pickDate(from: false),
                      child: Text('${AppStrings.dateTo}: ${_dateLabel(filter.dateTo)}'),
                    ),
                  ),
                ],
              ),
              if (filter.status != null ||
                  filter.dateFrom != null ||
                  filter.dateTo != null ||
                  filter.search.isNotEmpty) ...[
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () {
                    _search.clear();
                    ref.read(ordersFilterProvider.notifier).state =
                        const OrdersFilter();
                  },
                  child: const Text(AppStrings.clearFilters),
                ),
              ],
            ],
          ),
        ),
        Expanded(
          child: async.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('$e'),
                  const SizedBox(height: 8),
                  FilledButton(
                    onPressed: () =>
                        ref.read(ordersPagedProvider.notifier).refresh(),
                    child: const Text(AppStrings.retry),
                  ),
                ],
              ),
            ),
            data: (state) {
              if (state.items.isEmpty) {
                return RefreshIndicator(
                  onRefresh: () =>
                      ref.read(ordersPagedProvider.notifier).refresh(),
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: const [
                      SizedBox(height: 120),
                      Center(child: Text(AppStrings.emptyList)),
                    ],
                  ),
                );
              }
              return RefreshIndicator(
                onRefresh: () =>
                    ref.read(ordersPagedProvider.notifier).refresh(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  itemCount: state.items.length + (state.hasMore ? 1 : 0),
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    if (index >= state.items.length) {
                      return MutationButton(
                        label: AppStrings.loadMore,
                        loading: state.loadingMore,
                        filled: false,
                        onPressed: state.loadingMore
                            ? null
                            : () async {
                                try {
                                  await ref
                                      .read(ordersPagedProvider.notifier)
                                      .loadMore();
                                } catch (e) {
                                  if (context.mounted) {
                                    showActionError(context, e);
                                  }
                                }
                              },
                      );
                    }
                    final o = state.items[index];
                    return ControlListCard(
                      title: o.orderNumber.isNotEmpty ? o.orderNumber : o.id,
                      subtitle: [
                        if (o.businessName != null) o.businessName!,
                        formatMoney(o.total),
                        if (o.customerPhone != null) o.customerPhone!,
                        if (o.createdAt != null) formatDateTime(o.createdAt),
                      ].join(' · '),
                      trailing: StatusChip(status: o.status),
                      onTap: () => showDetailSheet(
                        context: context,
                        title: AppStrings.details,
                        builder: (_) => OrderDetailSheet(order: o),
                      ),
                    );
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
