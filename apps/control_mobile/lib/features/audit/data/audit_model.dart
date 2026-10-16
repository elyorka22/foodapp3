import '../../../core/utils/json_parse.dart';

class AuditLogUser {
  const AuditLogUser({
    required this.id,
    this.fullName,
    this.email,
    this.role,
  });

  final String id;
  final String? fullName;
  final String? email;
  final String? role;

  factory AuditLogUser.fromJson(Map<String, dynamic> json) {
    return AuditLogUser(
      id: json['id'] as String? ?? '',
      fullName: json['fullName'] as String?,
      email: json['email'] as String?,
      role: json['role'] as String?,
    );
  }
}

class AuditLogEntry {
  const AuditLogEntry({
    required this.id,
    required this.action,
    required this.entity,
    this.userId,
    this.entityId,
    this.metadata,
    this.createdAt,
    this.user,
  });

  final String id;
  final String action;
  final String entity;
  final String? userId;
  final String? entityId;
  final Map<String, dynamic>? metadata;
  final DateTime? createdAt;
  final AuditLogUser? user;

  factory AuditLogEntry.fromJson(Map<String, dynamic> json) {
    final userRaw = json['user'];
    return AuditLogEntry(
      id: json['id'] as String? ?? '',
      action: json['action'] as String? ?? '',
      entity: json['entity'] as String? ?? '',
      userId: json['userId'] as String?,
      entityId: json['entityId'] as String?,
      metadata: json['metadata'] is Map<String, dynamic>
          ? json['metadata'] as Map<String, dynamic>
          : null,
      createdAt: parseDateTime(json['createdAt']),
      user: userRaw is Map<String, dynamic>
          ? AuditLogUser.fromJson(userRaw)
          : null,
    );
  }
}
