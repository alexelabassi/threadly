using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Threadly.Api.Models;

namespace Threadly.Api.Data.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.HasIndex(u => u.NormalizedEmail).IsUnique();
        builder.Property(u => u.CreatedAt).IsRequired();
    }
}
