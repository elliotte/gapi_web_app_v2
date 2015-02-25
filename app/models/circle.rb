class Circle < ActiveRecord::Base
	belongs_to :user
	has_many :team_members, dependent: :destroy
	has_many :team_files, dependent: :destroy
	has_many :messages, dependent: :destroy
	has_many :wallpins, dependent: :destroy
end
