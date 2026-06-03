# Models

DTOs use typed `fromJson` factories (no `Map` in feature code).

## Freezed migration

To convert a model to Freezed + json_serializable:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'example.freezed.dart';
part 'example.g.dart';

@freezed
class Example with _$Example {
  const factory Example({required String id}) = _Example;
  factory Example.fromJson(Map<String, dynamic> json) => _$ExampleFromJson(json);
}
```

Then run:

```bash
dart run build_runner build --delete-conflicting-outputs
```
