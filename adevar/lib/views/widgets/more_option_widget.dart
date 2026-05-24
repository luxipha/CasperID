import 'package:flutter/material.dart';

class MoreOptionWidget extends StatelessWidget {
  final String title;

  final Widget leadingIcon;
  final Widget trailingIcon;

  final Color titleColor;

  final Function? onClicked;

  final int? index;
  final BuildContext buildContext;

  MoreOptionWidget({
    required this.title,
    required this.leadingIcon,
    required this.trailingIcon,
    required this.titleColor,
    this.index,
    this.onClicked,
    required this.buildContext,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        onClicked!(index, buildContext);
      },
      child: Container(
        width: double.infinity,
        margin: EdgeInsets.only(
            top: 5,
            bottom: 5,
            left: 10,
            right: 10),
        height: 40,
        child: Row(
          children: [
            leadingIcon,
            SizedBox(
              width: 12,
            ),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  color: titleColor,
                ),
              ),
            ),
            trailingIcon,
          ],
        ),
      ),
    );
  }
}
