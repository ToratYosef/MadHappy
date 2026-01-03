{
  title: "LowKeyHigh Hoodie",
  description: .description,
  blueprint_id: .blueprint_id,
  print_provider_id: .print_provider_id,

  variants: (.variants | map({
    id: .id,
    price: 7500,
    is_enabled: (.is_enabled // true)
  })),

  print_areas: (.print_areas | map({
    variant_ids: .variant_ids,
    placeholders: (.placeholders | map({
      position: .position,
      images: (.images | map(
        {
          id: .id,
          x: .x,
          y: .y,
          scale: .scale,
          angle: .angle
        }
        + (if (.pattern? != null) then {pattern: .pattern} else {} end)
      ))
    }))
  }))
}
