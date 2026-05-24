import 'package:flutter/material.dart';
import 'package:get/get.dart';

class BotmBar extends StatefulWidget {
  @override
  _BotmBarState createState() => _BotmBarState();
}
enum ExpansionStatus { open, close, idle }
class _BotmBarState extends State<BotmBar> {
  var bottomBarHeight =70;
  @override
  Widget build(BuildContext context) {
    ExpansionStatus expansionStatus = ExpansionStatus.idle;
    final bool shouldOpen = expansionStatus == ExpansionStatus.open;
    return Container();
  }
}
