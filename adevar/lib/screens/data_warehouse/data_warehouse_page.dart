import 'package:flutter/material.dart';
import '../../config/app_colors.dart';
import '../../services/api_service.dart';

class DataWarehousePage extends StatefulWidget {
  const DataWarehousePage({super.key});

  @override
  State<DataWarehousePage> createState() => _DataWarehousePageState();
}

class _DataWarehousePageState extends State<DataWarehousePage> {
  final _api = ApiService();
  bool _loading = true;
  List<Map<String, dynamic>> _devices = [];
  List<Map<String, dynamic>> _authorizations = [];
  List<Map<String, dynamic>> _activityLog = [];
  int _selectedTab = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final devices = await _api.get('/passkey/devices');
      final auths = await _api.get('/metamask/user/permissions');
      final activity = await _api.get('/activity-log');

      if (mounted) {
        setState(() {
          _devices = List<Map<String, dynamic>>.from(
              (devices is List ? devices : devices?['data'] ?? []) as List);
          _authorizations = List<Map<String, dynamic>>.from(
              (auths is List ? auths : auths?['data'] ?? []) as List);
          _activityLog = List<Map<String, dynamic>>.from(
              (activity is List ? activity : activity?['data'] ?? []) as List);
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        // If API fails, show empty state
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Data Vault'),
      ),
      body: Column(
        children: [
          // Tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                _buildTab('Devices', 0),
                const SizedBox(width: 8),
                _buildTab('Authorizations', 1),
                const SizedBox(width: 8),
                _buildTab('Activity', 2),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String label, int index) {
    final selected = _selectedTab == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : AppColors.textSub,
            fontWeight: FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    switch (_selectedTab) {
      case 0:
        return _buildDevicesList();
      case 1:
        return _buildAuthorizationsList();
      case 2:
        return _buildActivityLog();
      default:
        return const SizedBox();
    }
  }

  Widget _buildDevicesList() {
    if (_devices.isEmpty) {
      return _emptyState('No devices', 'Devices logged into your account will appear here');
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: _devices.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final device = _devices[index];
        return ListTile(
          contentPadding: const EdgeInsets.symmetric(vertical: 8),
          leading: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.phone_iphone_rounded, color: AppColors.primary),
          ),
          title: Text(
            device['deviceName'] ?? device['userAgent'] ?? 'Unknown Device',
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
          ),
          subtitle: device['lastLogin'] != null
              ? Text(
                  'Last login: ${device['lastLogin']}',
                  style: const TextStyle(fontSize: 13, color: AppColors.textSub),
                )
              : null,
          trailing: IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.alert),
            onPressed: () => _confirmDeleteDevice(device),
          ),
        );
      },
    );
  }

  Widget _buildAuthorizationsList() {
    if (_authorizations.isEmpty) {
      return _emptyState(
        'No authorizations',
        'Apps and services you\'ve authorized will appear here',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: _authorizations.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final auth = _authorizations[index];
        return ListTile(
          contentPadding: const EdgeInsets.symmetric(vertical: 8),
          leading: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.apps_rounded, color: AppColors.primary),
          ),
          title: Text(
            auth['appName'] ?? auth['name'] ?? 'Unknown App',
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
          ),
          subtitle: Text(
            'Granted access to your identity',
            style: const TextStyle(fontSize: 13, color: AppColors.textSub),
          ),
          trailing: IconButton(
            icon: const Icon(Icons.remove_circle_outline, color: AppColors.alert),
            onPressed: () => _confirmRevoke(auth),
          ),
        );
      },
    );
  }

  Widget _buildActivityLog() {
    if (_activityLog.isEmpty) {
      return _emptyState(
        'No activity yet',
        'Your identity usage history will show here',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: _activityLog.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final activity = _activityLog[index];
        return ListTile(
          contentPadding: const EdgeInsets.symmetric(vertical: 8),
          leading: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              _activityIcon(activity['type'] as String?),
              color: AppColors.primary,
            ),
          ),
          title: Text(
            activity['description'] ?? activity['type'] ?? 'Activity',
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
          ),
          subtitle: Text(
            activity['timestamp'] ?? activity['createdAt'] ?? '',
            style: const TextStyle(fontSize: 13, color: AppColors.textSub),
          ),
        );
      },
    );
  }

  IconData _activityIcon(String? type) {
    switch (type) {
      case 'login':
        return Icons.login_rounded;
      case 'verification':
        return Icons.verified_outlined;
      case 'share':
        return Icons.share_outlined;
      default:
        return Icons.info_outline;
    }
  }

  Widget _emptyState(String title, String subtitle) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: AppColors.textSub.withAlpha(80)),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textMain,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: AppColors.textSub),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteDevice(Map<String, dynamic> device) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Device'),
        content: const Text('This device will lose access to your account.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _deleteDevice(device);
            },
            child: const Text('Remove', style: TextStyle(color: AppColors.alert)),
          ),
        ],
      ),
    );
  }

  void _deleteDevice(Map<String, dynamic> device) async {
    try {
      final id = device['id'] ?? device['_id'];
      await _api.delete('/passkey/devices/$id');
      _loadData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Device removed')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to remove device: $e')),
        );
      }
    }
  }

  void _confirmRevoke(Map<String, dynamic> auth) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Revoke Access'),
        content: const Text('This app will no longer have access to your identity data.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _revokeAccess(auth);
            },
            child: const Text('Revoke', style: TextStyle(color: AppColors.alert)),
          ),
        ],
      ),
    );
  }

  void _revokeAccess(Map<String, dynamic> auth) async {
    try {
      final id = auth['grantId'] ?? auth['id'] ?? auth['_id'];
      await _api.delete('/metamask/user/permissions/$id');
      _loadData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Access revoked')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to revoke: $e')),
        );
      }
    }
  }
}
