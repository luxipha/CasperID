import 'package:flutter/material.dart';

class PostCategoryItem extends StatelessWidget {
  final String label;
  final Color textColor;
  final Color backgroundColor;
  final VoidCallback onTap;

  const PostCategoryItem({
    Key? key,
    required this.label,
    required this.textColor,
    required this.backgroundColor,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;

    return InkWell(
      onTap: onTap,
      child: Container(
        height: size.height * 0.05,
        width: size.width * 0.35,
        decoration: BoxDecoration(
          color: backgroundColor,
          border: Border.all(
            color: Color(0xFFD1D1D6),
            width: 1,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: size.height * 0.02,
              color: textColor,
            ),
          ),
        ),
      ),
    );
  }
}
