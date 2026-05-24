import 'package:flutter/material.dart';

class RatingBar extends StatelessWidget {
  final int rating;
  final int ratingAmount;
  final Color? color;
  const RatingBar({
    Key? key,
    required this.rating,
    required this.ratingAmount,
    this.color = Colors.blue,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text('$rating'),
        SizedBox(
          width: 5,
        ),
        Container(
          height: 5,
          width: 90,
          color: color,
        ),
        SizedBox(
          width: 5,
        ),
        Text('$ratingAmount'),
      ],
    );
  }
}
