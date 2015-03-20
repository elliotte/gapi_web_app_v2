class User < ActiveRecord::Base
	has_many :circles,  dependent: :destroy

	def self.join_and_create(email, google_id)
			user = User.new(email: email, google_id: google_id)
			user.save

			drive = $client.discovered_api('drive', 'v2')
	        team_members = TeamMember.all.where(google_id: user.google_id)
	        google = GoogleService.new($client, drive)

	        if team_members.present?
		        team_members.each do |team_member|
			      	teamfiles = team_member.circle.team_files
		            if teamfiles
		              teamfiles.each do |teamfile|
			                google.insert_new_files_permission( user, teamfile.file_id )
		              end
		              #end of teamFiles Loop
		            end
		            #end of if teamfiles catch
		        end
		        #end of teamMember loop
	        end
	        #end of teamMembers present catch
	end#end of method

	def load_my_team_names paramsQuery, googleSessionID
		#fetch teams user owns
		circle_names = []
		circles = self.circles.where("display_name ilike ?", "%#{paramsQuery}%").order('display_name ASC')
	    circles.each do |circle|
	      circle_names.push({ id: circle.id, name: circle.display_name})
	    end
		#fetch teams user is a member of
	    memberCircles = TeamMember.find(:all, :conditions => ["google_id LIKE ?", "%#{googleSessionID}%"])
		circle_ids = []
		memberCircles.each do |c|
			name = Circle.find(c.circle_id).display_name
			circle_names.push({id: c.circle_id, name: name})
		end
		return circle_names
	end

end


